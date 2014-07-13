var convict = require('convict');

var conf = convict({
    env: {
        doc: "The applicaton environment.",
        format: ["production", "development"],
        default: "development",
        env: "NODE_ENV"
    },

    secret: {
        doc: "Secret key used for salting emails and signing sessions. Never check this in!",
        format: String,
        default: "no key",
        env: "SECRET_KEY"
    },

    ip: {
        doc: "The IP address to bind.",
        format: "ipaddress",
        default: "127.0.0.1",
        env: "IP_ADDRESS",
    },

    port: {
        doc: "The port to bind.",
        format: "port",
        default: 5000,
        env: "PORT"
    }
});

var env = conf.get('env');

// if we need to add env-specific stuff, do so here.
//conf.loadFile('./config/' + env + '.json');
conf.validate();

module.exports = conf;
