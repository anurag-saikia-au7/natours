const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour should have a name'],
      unique: true,
      trim: true,
      maxlength: [30, 'should not be more than 30'],
      minlength: [10, 'should not be more than 30'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour should have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour should have group size'],
      min: [1, 'should be atleast 1'],
      max: [7, 'should not be more than 7'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour should have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'xyzabcdef',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour should have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'xyzabcdef',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a  summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { low: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`time taken: ${Date.now() - this.start}`);
  console.log('Docs accessed');
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
