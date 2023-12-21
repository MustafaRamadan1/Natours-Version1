import mongoose from 'mongoose';


const bookingModel = new  mongoose.Schema({

      tour:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking Must Belong to a tour ']
      },
      user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking Must Belong to a user ']
      },
      price: {
        type: Number,
        required: [true, 'Booking Must Belong to a price']
      },
      createdAt: {
        type: Date,
        default: Date.now()
      },
      paid:{
        type: Boolean,
        default: true
      }
});


bookingModel.pre(/^find/, function(next){

  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });

  next();
})


const Booking = mongoose.model('Booking', bookingModel);

export default Booking;
