const redis = require('redis');
console.log("REDIS INIT");

const client = redis.createClient({
    port: 6379,
    host: "127.0.0.1"
});
(async () => {
    await client.connect();
})();

client.on('connect', () => {
    console.log("connected to redis");
})

client.on('ready', () => {
    console.log("client connected to redis and ready to use ...");
})

client.on('error', (err) => {
    console.log(err.message);
})

client.on('end', () => {
    console.log("redis disconnected");
})

client.on('SIGINT', () => {
    client.quit();
})

module.exports = client;