var app = function() {

  var certListSelector = '#CertListBox';
  var hashSelector = '.hash';
  var hashJsSelector = '.hash-js';
  var base64Selector = '.base64';
  var signedSelector = '.signed';
  var activeTabSelector = '';

  var getCerts = function() {
    var list = crypto().getCertsList();
    // var list = $.capicom.getCertificatesList();
    var listCert = $(certListSelector).html('');
    for (var i in list) {
      listCert.append('<option value="' + list[i].thumbprint + '">' + list[i].displayName + '</option>');
    }
  }

  var getFile = function(cb) {
    $.get("/getRaw.php")
      .done(function(response) {
        cb(response);
      })
      .fail(function(error) {
        console.error('getHashClient error', error);
      });
  }

  var updateSignature = function(signed, filename) {
    $.post("/updateSignature.php", {data: signed, filename: filename})
      .done(function(response) {
        $(activeTabSelector + '.link-to-file').removeClass('hidden');
      })
      .fail(function(error) {
        console.error('updateSignature error', error);
      });
  }

  var sign = function() {
    var certSubject = getCert();
    if (!certSubject) {
      alert('Выберите сертификат!');
      return false;
    }
    getFile(function(data) {
      var signature = crypto().sign(data, false, certSubject);
      $(activeTabSelector + signedSelector).text(signature);
      updateSignature(signature, './download/capi-data.xml.sig');
    })
  }

  var getCert = function() {
    return $(certListSelector).val();
  }

  var init = function() {
    $('#sign').click(sign);
    getCerts();
  }

  return {
    init: init,
    sign: sign
  }
}();

$(document).ready(function() {
  app.init();
});
