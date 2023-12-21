import Stripe from "stripe";
import Tour from "../models/tourModel.js";
import catchAsync from "../utils/catchAsync.js";
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({path: `${__dirname}/../config.env`});

const stripe = Stripe(process.env.STRIPE_SECERT_KEY);

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  
  const tour = await Tour.findById(req.params.tourId);
  console.log(tour);
  // 2) Create checkout session
  try{
    const session = await stripe.checkout.sessions.create({
   
      mode: 'payment',
      success_url: `${req.protocol}://${req.get("host")}/`,
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


