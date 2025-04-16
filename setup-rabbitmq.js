const amqp = require('amqplib');

async function setupRabbitMQ() {
  console.log('Setting up RabbitMQ exchange and queues...');
  
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
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

    // Bind queues to the exchange
    await channel.bindQueue(kitchenQueue.queue, 'order_exchange', '');
    console.log(`Kitchen queue bound to exchange`);

    await channel.bindQueue(notificationQueue.queue, 'order_exchange', '');
    console.log(`Notification queue bound to exchange`);

    console.log('RabbitMQ setup completed successfully');

    // Close the channel and connection
    await channel.close();
    await connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error setting up RabbitMQ:', error);
  }
}

// Run the setup
setupRabbitMQ();

 