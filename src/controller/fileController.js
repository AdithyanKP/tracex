import { PrismaClient } from "@prisma/client";
import { S3 } from "aws-sdk";
import Busboy from "busboy";

const s3 = new S3();

const prisma = new PrismaClient();

export const uploadFile = async (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  let uploadPromise;
  let resourceUrl;
  const { id } = req.user;

  //streaming file content to s3 using busboy
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "application/pdf") {
      return res.status(400).send({ error: "Only PDF files are allowed." });
    }

    //TODO need to change the credentials
    const uploadParams = {
      Bucket: "your-s3-bucket-name",
      Key: `uploads/${filename}`,
      Body: file,
      ContentType: mimetype,
    };

    uploadPromise = s3
      .upload(uploadParams)
      .promise()
      .then((result) => {
        resourceUrl = result.Location;
        return resourceUrl;
      });
  });

  busboy.on("finish", async () => {
    try {
      await uploadPromise;
      const newResource = await prisma.resources.create({
        data: {
          user_id: parseInt(id, 10),
          resource_url: resourceUrl,
        },
      });

      res.status(200).json({
        message: "File uploaded successfully!",
        url: resourceUrl,
        resource: newResource,
      });
    } catch (err) {
      res.status(500).json({
        error: "Error uploading file or saving to database",
        details: err.message,
      });
    }
  });

  busboy.on("error", (error) => {
    res.status(500).json({ error: "Upload failed", details: error.message });
  });

  req.pipe(busboy);
};
