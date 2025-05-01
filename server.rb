require 'stripe'
require 'sinatra'
require 'dotenv/load'
require 'json'
require 'dotenv'

Dotenv.load
Stripe.api_key = ENV['STRIPE_SECRET_KEY']
puts "Stripe key: #{ENV['STRIPE_SECRET_KEY'].nil? ? 'Not found' : 'Found (not showing for security)'}"

set :port, 42069
set :static, true
set :public_folder, 'public'

# CORS preflight options
options "*" do
  response.headers["Allow"] = "GET, POST, OPTIONS"
  response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, X-User-Email, X-Auth-Token"
  response.headers["Access-Control-Allow-Origin"] = "*"
  200
end

# CORS headers for all routes
before do
  content_type 'application/json'
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
end

# This route creates a SetupIntent for the subscription
post '/api/create-subscription-intent' do
  data = JSON.parse(request.body.read)
  product_id = data['productId']
  
  begin
    setup_intent = Stripe::SetupIntent.create(
      payment_method_types: ['card'],
      metadata: {
        product_id: product_id
      }
    )
    
    {
      clientSecret: setup_intent.client_secret
    }.to_json
  rescue Stripe::StripeError => e
    status 400
    { error: e.message }.to_json
  end
end

# This route creates a customer and a subscription
post '/api/create-subscription' do
  data = JSON.parse(request.body.read)
  payment_method_id = data['paymentMethodId']
  product_id = data['productId']
  customer_info = data['customerInfo']
  
  begin
    # Create a customer
    customer = Stripe::Customer.create(
      payment_method: payment_method_id,
      email: customer_info['email'],
      name: customer_info['name'],
      invoice_settings: {
        default_payment_method: payment_method_id
      }
    )
    
    # Store the userId for later reference if provided
    if customer_info['userId']
      Stripe::Customer.update(
        customer.id,
        metadata: { user_id: customer_info['userId'] }
      )
    end
    
    # Get the price ID for the product
    price_id = get_price_id_for_product(product_id)
    
    # Create a subscription
    subscription = Stripe::Subscription.create(
      customer: customer.id,
      items: [{ price: price_id }],
    )   

    
    # Prepare response
    response = {
      subscriptionId: subscription.id,
      status: subscription.status
    }
    response[:status] = 'succeeded' 
    
    # Log the subscription creation
    puts "Created subscription for customer #{customer.id}: #{subscription.id} with status: #{subscription.status}"
    
    response.to_json
  rescue Stripe::StripeError => e
    status 400
    { error: e.message }.to_json
  end
end

get '/' do
  "This is the backend :)"
end

# Helper method to get the price ID for a product
def get_price_id_for_product(product_id)
  prices = Stripe::Price.list(product: product_id, active: true, limit: 1)
  
  if prices.data.empty?
    raise "No active price found for product #{product_id}"
  end
  prices.data.first.id
end