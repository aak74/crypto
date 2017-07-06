var crypto = function() {
  var getHash = function(data) {
    return $.capicom.getHash(data);
  }

  var sign = function(rawData, detached, cert_hash) {
    // console.log('crypto sign', rawData, detached, cert_hash);
    return $.capicom.sign(rawData, detached, cert_hash);
  }

  var getCertsList = function() {
    return $.capicom.getCertificatesList();
  }

  return {
    getHash: getHash,
    getCertsList: getCertsList,
    sign: sign,
  }
}
