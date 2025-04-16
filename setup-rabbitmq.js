const amqp = require('amqplib');

async function setupRabbitMQ() {
  console.log('Setting up RabbitMQ exchange and queues...');
  
  let connection;
  
  try {
    // Connect to RabbitMQ
    connection = await amqp.connect('amqp://localhost:5672');
    console.log('Connected to RabbitMQ');
    
    // Create a channel
    const channel = await connection.createChannel();
    console.log('Channel created');

    // Create the exchange
    await channel.assertExchange('order_exchange', 'fanout', { 
      durable: false,
      autoDelete: false 
    });
    console.log('Exchange "order_exchange" created successfully');

    // Create the queues
    const kitchenQueue = await channel.assertQueue('kitchen_queue', {
      durable: false,
      autoDelete: false
    });
    console.log(`Kitchen queue "${kitchenQueue.queue}" created successfully`);

    const notificationQueue = await channel.assertQueue('notification_queue', {
      durable: false,
      autoDelete: false
    });
    console.log(`Notification queue "${notificationQueue.queue}" created successfully`);
    
    // Create the order queue
    const orderQueue = await channel.assertQueue('order_queue', {
      durable: false,
      autoDelete: false
    });
    console.log(`Order queue "${orderQueue.queue}" created successfully`);

    // Bind queues to the exchange
    await channel.bindQueue(kitchenQueue.queue, 'order_exchange', '');
    console.log(`Kitchen queue bound to exchange`);

    await channel.bindQueue(notificationQueue.queue, 'order_exchange', '');
    console.log(`Notification queue bound to exchange`);
    
    // No need to bind order_queue as the order service is only a publisher

    console.log('RabbitMQ setup completed successfully');

    // Close the channel and connection
    await channel.close();
    console.log('Channel closed');
  } catch (error) {
    console.error('Error setting up RabbitMQ:', error);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Connection closed');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Run the setup
setupRabbitMQ();

 