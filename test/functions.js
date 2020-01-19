
exports.helloWorld = (req, res) => {
  console.log('call helloWorld');
  res.send('Hello, World');
};

exports.helloEvent = (event, context) => {
    console.log('call helloEvent');
    const str = Buffer.from(event.data, 'base64').toString();
    const data = JSON.parse(str);
    return data;
}