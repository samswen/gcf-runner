
exports.helloWorld = (req, res) => {
  console.log('call helloWorld');
  res.send('Hello, World');
};

exports.helloEvent = (event, context) => {
    console.log('call helloEvent');
    return Buffer.from(event.data, 'base64').toString();
}