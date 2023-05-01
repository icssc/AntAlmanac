const setup = require('./server');
const port = 8080;

app = setup('dev');
app.listen(port);
console.info(`listening on http://localhost:${port}`);
