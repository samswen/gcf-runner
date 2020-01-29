
// async
exports.helloWorld = async (req, res) => {
  console.log('call helloWorld');
  res.send('Hello, World');
};

// not async
exports.helloEvent = (event, context) => {
    console.log('call helloEvent');
    return Buffer.from(event.data, 'base64').toString();
}