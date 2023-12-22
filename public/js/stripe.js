/* eslint-disable */
import axios from 'axios';
import {showAlert} from './alerts'
 const stripe = Stripe('pk_test_51ONeMvDEtOyZ7yLRrg0kSAiLxYV2Bl8t0JE9Q6gFsSxwf2MbDbHpMzzs753NYeecuOwR5R2C8y2Xf3yDW1FbIPiq008pEcOXsG');


 export const bookTour = async (tourId)=>{

  try{
      //1) get the checkout session from the server  

 
  const session = await axios(`/api/v1/bookings/checkout-session/${tourId }`);




  
  //2) create checkout page or form based on the public key plus charge the credit card for us 

  stripe.redirectToCheckout({
    sessionId: session.data.session.id
  })
  }

  catch(err){
    
    showAlert('error', err)
  }


 }