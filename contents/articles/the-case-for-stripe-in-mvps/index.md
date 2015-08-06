---
title: The Case for Stripe in MVP Apps
author: jeff
date: 2015-04-25 15:00
template: article.jade
---

With so many options available for online payments, I wanted to summarize
the reasons why I feel strongly that it makes sense to use
[Stripe](https://stripe.com) when building minimum viable products.

## Focus on your business, not on payments

In a recent startup, we integrated with an internal payment system.

We probably lost 6 man-months of productivity. At times, it *felt like
we were in the payment business* - not in the business we were
trying to build.

Focusing on the wrong thing is what kills startups.

## Mature, easy, and well documented APIs

Stripe has top-notch APIs, but their documentation and libraries
are some of the best for any SaaS that I have ever seen. On
[several projects](https://docs.respoke.io/js-library)
we've used Stripe's docs as the model, but it's deceivingly difficult to produce
something so complete and so simple to digest.

Other providers have solid APIs, but they may not be mature.

- [Braintree](https://www.braintreepayments.com)
- [PaySimple](https://paysimple.com)

Some providers have bad APIs, but are mature:

- [PayPal](https://paypal.com)
- [Forte](https://www.forte.net/pricing) - very poor customer service though

## Easy to find developers

Along with excellent mature APIs comes an army of developers who can help
work on your Stripe integrations. For non-technical founders, you will not
have a hard time finding people with extensive Stripe experience (like me!).

## The best user interface

People can forget that there's a lot more to a payment provider than
the APIs, too.

With Stripe's UI, you can answer common business questions really easily. Things
that you would have to build in your web app. Things that help you assess
your startup's burn rate. Things that help you service customers without
wasting time.

- What was the payment lifecycle?
- How much has this customer payed me?
- Do I have customers with the same email but different `customerId`s?
- How many customers do I have?
- When is a customer's next invoice? When was their last invoice? Did they
pay it?
- Who has expired credit cards?
- How much revenue did I have in the past week?
- How much have I paid in credit card fees?
- How much money do I have in escrow with Stripe?

Try to answer all of these questions on another provider
in less than a minute - you can do it with Stripe.

The user interface is *so good* that you can just give customer service
reps limited access. No technical knowledge required.

## Easy international charges

Stripe does the currency conversions automatically and you never really have to think
about it. I can't express how much time this saves over other options, and allows
your startup to charge internationally much earlier.

## Bitcoin

Stripe is a mature payment provider that offers BTC integration. Other providers
of Bitcoin billing are not as mature, but they do work pretty well.

- [Braintree](https://www.braintreepayments.com)
- [BitPay](https://bitpay.com/)
- [Coinbase](https://www.coinbase.com/merchants)
- [Gocoin](https://www.gocoin.com/)

## Excellent webhook support

For any action on Stripe, you can get a `POST` webhook event to your server.
This is incredibly useful for building all kinds of custom integrations with
your CRM, doing additional billing, tracking internal analytics, and more.

Stripe will keep sending webhooks in case your server goes down, ensuring
you get the data and respond with a success code. That saves you from having
to implement a message queue (MQ) for payment things.

## Recurring payments and trials

Stripe squarely handles this exceedingly complex trap-of-a-feature
that plagues many SaaS services.
I continue to be impressed how easy they make recurring payments.

Because of the payment lifecycle in Stripe, you can also do
advanced billing pretty easily.

## Advanced billing and storing metadata

I worked with a startup that had plans with tiers of service credits.
So they wanted to:

- charge a monthly service fee
- give X credits with the plan
- track credit usage during the month
- bill all customers on the 1st of the month
- calculate any credit overage and add that to the invoice before the
customer was charged

This whole billing lifecycle took only about 25 hours to implement from start
to finish. Doing the same thing on other providers isn't really possible,
or requires hacky workarounds. With Stripe, it was a natural part of the
recurring billing lifecycle - that means we could produce clean code without
dangerous hacks. Trust me, you don't want hacky asynchonous checks in your
billing system.

Every "object" in Stripe - `plan`, `charge`, `customer`, etc. -
can have stored `metadata` in the form of a simple JSON object hash. We just
stored the plan limits inside the Stripe `plan.metadata` - so all the plan data
was in one place. Then we used webhook events to add additional line items
for plan overages. Stripe gives you a chance to update an invoice generated
by recurring billing, before they actually charge the customer.

## Where it falls short

**Bank account charges.** There are really limited options on the internet
for charging bank accounts directly. Stripe is not one of those options. eCheck
payment kind of suck though because you typically have to first have the
customer verify their details with micro-deposits.

- [PaySimple](http://paysimple.com)
- [PayPal](http://paypal.com)
- [Braintree](https://www.braintreepayments.com)
- [Forte](https://www.forte.net/pricing) - requires extensive background checks

**3rd party transfers**. Stripe did away with their transfers API and
is pushing Stripe Connect. Stripe Connect is a an excellent service, but it's not as easy as
it used to be - a simple ACH transfer by providing the routing number and account number.
I miss those days.

**Fees (maybe)**. The fees are about average. However, in my opinion they
more than justify the time savings during development, the UI tools, and
the customer service (yes, it's pretty good, I have used it).
