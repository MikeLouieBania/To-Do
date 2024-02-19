import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://MikeBania:mikopogi@cluster0.ve2uhfx.mongodb.net/";
const client = new MongoClient(uri);
async function connectToDatabase() {
  await client.connect();
  const db = client.db("todoApp");
  return db.collection("tasks");
}

export default async (req, res) => {
  try {
    const tasksCollection = await connectToDatabase();

    if (req.method === 'POST') {
      const { task } = req.body;
      const newTask = {
        task,
        status: 'ongoing'
      };
      await tasksCollection.insertOne(newTask);
      return res.status(201).send(newTask);
    }

    else if (req.method === 'PATCH') {
      const { id, ...update } = req.body;
      const result = await tasksCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
      );
      return res.status(200).send({ updated: result.modifiedCount });
    }

    else if (req.method === 'DELETE') {
      const { id } = req.body;
      await tasksCollection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ deleted: true });
    }

    else if (req.method === 'GET') {
      const tasks = await tasksCollection.find({}).toArray();
      return res.status(200).json(tasks);
    }

    else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }

  catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};