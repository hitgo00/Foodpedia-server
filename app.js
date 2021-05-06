const express = require('express');

const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');

// Use
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors());

// env file config
dotenv.config();

// Connect to DB Atlas
mongoose
  .connect(process.env.DB_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((e) => {
    console.log('Database Error');
    console.log(e);
  });

// Models / Schemas
const UserSchema = new mongoose.Schema(
  {
    email: String,
    food_journal_items: [
      {
        cal: Number,
        carbo: Number,
        fat: Number,
        fibre: Number,
        name: String,
        prot: Number,
        sod: Number,
        url: String,
      },
    ],
  },
  {
    collection: 'Users',
    timestamps: true,
    minimize: false,
  },
);
const User = mongoose.model('User', UserSchema);

// Routes ..
app.get('/', (req, res) => {
  res.send('<h1>FoodPedia</h1>');
});

// Send All food_journal_items for given email and send response
app.post('/getItems', async (req, res) => {
  try {
    await User.find(
      { email: req.body.email },
      { food_journal_items: 1 },
      (err, docs) => {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        } else {
          console.log(docs);
          const response = {
            ok: true,
            data: docs[0].food_journal_items,
            msg: 'Data Send Successfully',
          };
          res.status(200).send(response);
        }
      },
    );
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// Add items to journal => Request should have email and food_journal_item Object..
app.post('/addItem', async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { email: req.body.email },
      { $push: { food_journal_items: req.body.foodItem } },
      { upsert: true },
    );
    const response = {
      ok: true,
      msg: 'Item added Successfully',
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// For testing
app.post('/adduser', async (req, res) => {
  // Add to the database
  const date = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
  console.log(req.body);

  const chk = await User.find({ email: req.query.email });
  if (chk) {
    res.send('user already exists');
  }
  const user = new User({
    username: 'hemang_test', // will be retrieved from the gid
    email: req.query.email,
    food_journal_items: [
      {
        food_name: req.body.food_journal_items.food_name,
        image_url: req.body.food_journal_items.image_url,
        created: date,
        metadata: req.body.food_journal_items.metadata,
      },
    ],
  });
  await user.save((err, result) => {
    if (err) res.send(err);
    else {
      console.log('FoodItem Added');
      res.send(result);
    }
  });
});

// Server Listening
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Server has started'));
