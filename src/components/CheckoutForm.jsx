import { Form, redirect } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import FormInput from './FormInput';
import SubmitBtn from './SubmitBtn';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { clearCart } from '../features/cart/cartSlice';

// Load Stripe.js with your public key
const stripePromise = loadStripe('pk_test_51IMv4JEWwIPmlcxVmC8To2xJ73MrD0859GujZKvSWNms2cRsfbcXpCt1wyibhzloPT9g0GHhzS1IxR5TMsGgvHQS00VNksFICx');

export const action = (store, queryClient) => async ({ request }) => {
  const formData = await request.formData();
  const { name, address } = Object.fromEntries(formData);
  const user = store.getState().userState.user;
  const { cartItems, orderTotal, numItemsInCart } = store.getState().cartState;

  const formattedCartItems = cartItems.map(item => ({
    title: item.title,
    price: parseInt(item.price),
    quantity: item.amount,
  }));

  const info = {
    name,
    address,
    chargeTotal: orderTotal,
    cartItems: formattedCartItems,
    numItemsInCart,
  };

  try {
    // Create a checkout session with your backend
    const response = await customFetch.post(
      '/orders',
      { data: info },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    const { sessionId } = response.data;

    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Stripe checkout error:', error);
      toast.error('There was an error with the payment process');
      return null;
    }

    queryClient.removeQueries(['orders']);
    store.dispatch(clearCart());
    toast.success('Order placed successfully');
    return redirect('/orders');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.error?.message ||
      'There was an error placing your order';
    toast.error(errorMessage);
    if (error?.response?.status === 401 || 403) return redirect('/login');
    return null;
  }
};

const CheckoutForm = () => {
  return (
    <Form method='POST' className='flex flex-col gap-y-4'>
      <h4 className='font-medium text-xl capitalize'>Shipping Information</h4>
      <FormInput label='First Name' name='name' type='text' />
      <FormInput label='Address' name='address' type='text' />
      <div className='mt-4'>
        <SubmitBtn text='Place Your Order' />
      </div>
    </Form>
  );
};

export default CheckoutForm;
