var clientCollections = DEPNES.namespace('client.collections'),
    clientHelpers = DEPNES.namespace('client.helpers');

clientHelpers.callout = function (type, message, duration) {
  clientCollections.Callouts.insert({
    type: type,
    message: message,
    duration: duration
  });
};
