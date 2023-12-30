import Stripe from "stripe";
import Tour from "../models/tourModel.js";
import Booking from '../models/bookingModel.js'
import {createOne, deleteOne, getAll, getOne, updateOne} from './handlerFactory.js'
import catchAsync from "../utils/catchAsync.js";
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import User from "../models/userModel.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({path: `${__dirname}/../config.env`});

const stripe = Stripe(process.env.STRIPE_SECERT_KEY);

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  try{
    const session = await stripe.checkout.sessions.create({
   
      mode: 'payment',
      success_url: `${req.protocol}://${req.get("host")}/my-tours`,
      // success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourId}&user=${req.user._id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get("host")}/tours/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data:{
            currency: "usd",
            product_data:{
              name: `${tour.name} Tour`,
              description: tour.summary,
              images:[ `https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
            unit_amount:  tour.price * 100,
          },
          quantity: 1
        }
      ]
    });
    
    console.log(session);
    // 3) Create session as response
    res.status(200).json({
      status: "success",
      session
    });
  }
  catch(err){
    console.log(err);
  }
});

// we will replace it by the web hook to make a post request after payment operation success 

// export const  createBookingCheckout = catchAsync(async(req, res , next)=>{

//   //  this is Temp for create booking when the user charge  cuz it's not secure 
//   const {tour, user, price} = req.query;

//   if(!tour || !user || !price) return next();

//  const booking =  await Booking.create({tour, user, price});


//   res.redirect(req.originalUrl.split('?')[0]);
// })


const createBookingCheckout = async session =>{
  const tour = session.client.reference_id;
  const user = (await User.findOne({email:session.customer_email}))._id;
  const price =  session.line_items[0].price_data.unit_amount;
   await Booking.create({tour, user, price});
}


export const  webhookCheckout = (req, res , next)=>{

    let event;
    try{
      const signature = req.headers['stripe-signature'];

     event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECERT)
    }
    catch(err){
      return res.status(400).send(`webHook error: ${err.message}`);
    }


    if(event.type == 'checkout.session.completed')
      createBookingCheckout(event.data.object);

      res.status(200).json({received: true})

}


export const createBooking = createOne(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
export const getBooking = getOne(Booking);
export const getAllBookings = getAll(Booking);

