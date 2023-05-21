const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pyrxehg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


	const toysCollection = client.db('Toys-Car').collection('Toys')

	app.get('/allToys/:text', async(req, res) => {
		if(req.params.text == "SportsCar" || req.params.text == "Truck" || req.params.text == "PoliceCar") {
			const result = await toysCollection
			.find({category: req.params.text})
			.toArray();
			console.log(result)
			return res.send(result);
		}
		// const result = await toysCollection.find({}).toArray();
		// res.send(result)
	})

	app.post('/postToys', async(req, res) => {
		const body = req.body;
		const result = await toysCollection.insertOne(body)
		console.log(result);
		res.send(result)
	});

	app.get('/allToy', async(req, res) => {
		const cursor = toysCollection.find({});
		const result = await cursor.toArray();
		const parts = result.reverse();
		res.send(parts)
	});

	// app.get('/toy/:id', async(req, res)=>{

	// 	const id = req.params.id;
	// 	console.log(id);
	// 	const selectedToy = toysCollection.find(selectedToy=> selectedToy.id === id);
	// 	console.log(selectedToy)
	// 	return res.json(selectedToy)
	// })

	app.get('/myToys/:email', async(req, res) => {
		console.log(req.params.email);
		const result = await toysCollection
		.find({email: req.params.email})
		.toArray();
		res.send(result)
	})


	const indexKeys = {ToysName: 1};
	const indexOptions = {name:"toysName"};

	const result = await toysCollection.createIndex(indexKeys,
	indexOptions)

	app.get('/toysSearchByToyName/:text', async(req, res) => {
		const searchText = req.params.text;

		const result = await toysCollection.find({
			$or:[
				{ToysName: {$regex: searchText, $options: "i"}}
			]})
		.toArray();
		res.send(result)
	});

	//get data by id
	app.get("/singleToy/:id", async (req, res) => {
		const id = req.params.id;
		const query = {
		  _id: new ObjectId(id),
		};
  
		const options = {
		  projection: {
			text: 1,
			Price: 1,
			ToysName: 1,
			category: 1,
			Url: 1,
			email: 1,
			Rating: 1,
			DetailDescription: 1,
			AvailableQuantity: 1,
			_id: 1,
		  },
		};
  
		const result = await toysCollection.findOne(query, options);
		res.send(result);
	  });
	  //receive data for update data
	  app.get('/update/:id', async(req, res) => {
		const id = req.params.id;
		const query = {_id: new ObjectId(id)}
		const result = await toysCollection.findOne(query);
		res.send(result)
	  });
	  //update data
	  app.put('/update/:id', async(req, res) => {
		const id = req.params.id;
		const filter = {_id: new ObjectId(id)}
		const option = {upsert: true};
		const updatedToy = req.body;
		const toy = {
			$set:{
				Price: updatedToy.Price,
				AvailableQuantity: updatedToy.AvailableQuantity,
				DetailDescription: updatedToy.DetailDescription
			}
		}
		const result = await toysCollection.updateOne(filter, toy, option)
		res.send(result)
	})


	app.delete('/myToyDelete/:id', async(req, res) => {
		const id = req.params.id;
		console.log(id)
		const query = {_id: new ObjectId(id)}
		const result = await toysCollection.deleteOne(query);
		res.send(result)
	})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  
	



} finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
	res.send('toys is running')
});

app.listen(port, () => {
	console.log(`toys doctor is running on port ${port}`)
})