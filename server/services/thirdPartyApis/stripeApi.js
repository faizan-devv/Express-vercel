const { BadRequestError } = require('../../utils/errorTypes');
const stripe = require('stripe')(
  'sk_test_51OAp2uBFpnXJqpDZy5xTTBWWMgfDiMFueTwSoCGC2anZDEXBswwO86awlupbzKifTZZO6rCVBlJRDGODd2l7cBZt00LvJbNxv3'
);

const updateSubscriptionCard = async (clientBaseUrl, subscriptionId) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.customer,
    return_url: `${clientBaseUrl}/settings/company-settings/billing?updateCard=success`,
    flow_data: {
      type: 'payment_method_update',
    },
  });
  return session;
};
const updateSubscription = async (subscriptionId, newPlanId) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const price = await stripe.prices.retrieve(newPlanId);
  const updatedSubscription = await stripe.subscriptions.update(
    subscription.id,
    {
      items: [
        {
          id: subscription.items.data[0].id,
          price: price.id,
        },
      ],
    }
  );
  return updatedSubscription;
};

const cancelSubscription = async (subscriptionId) => {
  await stripe.subscriptions.cancel(subscriptionId);
};

const createCheckoutSession = async (clientBaseUrl, priceId) => {
  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${clientBaseUrl}/settings/company-settings/plans-pricing/success`,
    cancel_url: `${clientBaseUrl}/settings/company-settings/plans-pricing/failure`,
  });

  return {
    description: 'Stripe API redirect',
    status: 303,
    sessionsId: session.id,
    url: `${session.url}`,
  };
};

const fetchUpdatedCard = async (subscriptionId) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customer = await stripe.customers.retrieve(subscription.customer);
  const defaultCardId = customer.invoice_settings.default_payment_method;
  const paymentMethods = await stripe.customers.listPaymentMethods(
    customer.id,
    { type: 'card' }
  );
  const dataObject = paymentMethods.data.find(
    (card) => card.id === defaultCardId
  );
  return {
    card: dataObject.card,
  };
};
const createPortalSession = async (clientBaseUrl, sessionId) => {
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  // This is the url to which the customer will be redirected when they are done
  // managing their billing with the portal.
  const returnUrl = clientBaseUrl;
  // const portalSession = await stripe.billingPortal.sessions.create({
  //   customer: checkoutSession.customer,
  //   return_url: returnUrl,
  // });
  const invoice = await stripe.invoices.retrieve(checkoutSession.invoice);
  const subscription = await stripe.subscriptions.retrieve(
    checkoutSession.subscription
  );
  const product = await stripe.products.retrieve(subscription.plan.product);
  const customer = await stripe.customers.retrieve(subscription.customer);
  const paymentMethods = await stripe.customers.listPaymentMethods(
    customer.id,
    { type: 'card' }
  );
  return {
    subscription: {
      nextPayment: subscription.current_period_end,
      subscriptionId: subscription.id,
      plan: product.name,
    },
    card: paymentMethods.data[0].card,
    invoice,
    description: 'Stripe API redirect',
    status: 303,
    //url: portalSession.url,
  };
};

const stripeWebHook = async (req) => {
  // req.body = req.body.toString();
  let event = req.body;
  // Replace this endpoint secret with your endpoint's unique secret
  // If you are testing with the CLI, find the secret by running 'stripe listen'
  // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
  // at https://dashboard.stripe.com/webhooks
  const endpointSecret =
    'whsec_fb8672528bc3747373406b9850b3e886ccd4e8b0a1eff468ee73b828ef7d60d4';
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      throw new BadRequestError(
        `⚠️  Webhook signature verification failed.`,
        err.message
      );
    }
  }
  let subscription;
  let status;
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.trial_will_end':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription trial ending.
      // handleSubscriptionTrialEnding(subscription);
      break;
    case 'customer.subscription.deleted':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription deleted.
      // handleSubscriptionDeleted(subscriptionDeleted);
      break;
    case 'customer.subscription.created':
      subscription = event.data.object;
      break;
    case 'customer.subscription.updated':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription update.
      // handleSubscriptionUpdated(subscription);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
};
module.exports = {
  fetchUpdatedCard,
  updateSubscriptionCard,
  cancelSubscription,
  createCheckoutSession,
  createPortalSession,
  stripeWebHook,
  updateSubscription,
};
