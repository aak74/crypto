var isPluginEnabled = false;
var async_code_included = 0;
var async_Promise;
var async_resolve;
function include_async_code()
{
	if(async_code_included)
	{
		return async_Promise;
	}
	var fileref = document.createElement('script');
	fileref.setAttribute("type", "text/javascript");
	fileref.setAttribute("src", "js/async_code.js?v=12");
	document.getElementsByTagName("head")[0].appendChild(fileref);
	async_Promise = new Promise(function(resolve, reject){
		async_resolve = resolve;
	});
	async_code_included = 1;
	return async_Promise;
}

function Common_CheckForPlugIn(id) {
	var canAsync = !!cadesplugin.CreateObjectAsync;
	if(canAsync)
	{
		include_async_code().then(function(){
			return CheckForPlugIn_Async(id);
		});
	}
	else
	{
		return CheckForPlugIn_NPAPI(id);
	}
}

//---
function Common_GetCertificate(id, cb)
{
	var canAsync = !!cadesplugin.CreateObjectAsync;
	if(canAsync)
	{
		include_async_code().then(function(){
			GetCertificate_Async(id).then(
				function(result) {
					cb(result[0], result[1]);
				},
				function(result) {
					alert(result);
				}
			);
		});
	}
	else
	{
		var oCert = GetCertificate_NPAPI(id);
		if (typeof(oCert) != 'undefined') cb(oCert, oCert.Export(0));
	}
}

function Common_SignHash(oCert, hash, cb)
{
	var canAsync = !!cadesplugin.CreateObjectAsync;
	if(canAsync)
	{
		include_async_code().then(function(){
			SignHash_Async(oCert, hash).then(
				function(result) {
					cb(result);
				},
				function(result) {
					alert(result);
				}
			);
		});
	}
	else
	{
		var result = SignHash_NPAPI(oCert, hash);
		if (typeof(result) != 'undefined') cb(result);
	}
}

function Common_Hash(oCert, data, cb)
{
	var canAsync = !!cadesplugin.CreateObjectAsync;
	if(canAsync)
	{
		include_async_code().then(function(){
			Hash_Async(oCert, data).then(
				function(result) {
					cb(oCert, result);
				},
				function(result) {
					alert(result);
				}
			);
		});
	}
	else
	{
		var result = Hash_NPAPI(oCert, data);
		if (typeof(result) != 'undefined') cb(oCert, result);
	}
}

function GetCertificate_NPAPI(certListBoxId) {
    var e = document.getElementById(certListBoxId);
    var selectedCertID = e.selectedIndex;
    if (selectedCertID == -1) {
        alert("Select certificate");
        return;
    }

    var thumbprint = e.options[selectedCertID].value.split(" ").reverse().join("").replace(/\s/g, "").toUpperCase();
    try {
        var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
        oStore.Open();
    } catch (err) {
        alert('Failed to create CAdESCOM.Store: ' + GetErrorMessage(err));
        return;
    }

    var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
    var oCerts = oStore.Certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);

    if (oCerts.Count == 0) {
        alert("Certificate not found");
        return;
    }
    var oCert = oCerts.Item(1);
    return oCert;
}

function SignHash_NPAPI(oCert, hash) {
	var oHashedData = cadesplugin.CreateObject("CAdESCOM.HashedData");
	oHashedData.Algorithm = 100; 
	oHashedData.SetHashValue(hash);

	var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
	oSigner.Certificate = oCert;
	var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");
	try {
		var sSignedMessage = oSignedData.SignHash(oHashedData, oSigner, 1/*CADESCOM_CADES_BES*/);
	} catch (err) {
		alert("Failed to create signature. Error: " + GetErrorMessage(err));
		return;
	}
	return sSignedMessage;
}

function Hash_NPAPI(oCert, data) {
	var oHashedData = cadesplugin.CreateObject("CAdESCOM.HashedData");
	oHashedData.Algorithm = 100; 
	oHashedData.DataEncoding = 1;
	oHashedData.Hash(data);
	var sHashValue = oHashedData.Value;
	return sHashValue;
}

function MakeVersionString(oVer)
{
    var strVer;
    if(typeof(oVer)=="string")
        return oVer;
    else
        return oVer.MajorVersion + "." + oVer.MinorVersion + "." + oVer.BuildVersion;
}

function CheckForPlugIn_NPAPI(id) {
    function VersionCompare_NPAPI(StringVersion, ObjectVersion)
    {
        if(typeof(ObjectVersion) == "string")
            return -1;
        var arr = StringVersion.split('.');

        if(ObjectVersion.MajorVersion == parseInt(arr[0]))
        {
            if(ObjectVersion.MinorVersion == parseInt(arr[1]))
            {
                if(ObjectVersion.BuildVersion == parseInt(arr[2]))
                {
                    return 0;
                }
                else if(ObjectVersion.BuildVersion < parseInt(arr[2]))
                {
                    return -1;
                }
            }else if(ObjectVersion.MinorVersion < parseInt(arr[1]))
            {
                return -1;
            }
        }else if(ObjectVersion.MajorVersion < parseInt(arr[0]))
        {
            return -1;
        }

        return 1;
    }

    function GetCSPVersion_NPAPI() {
        try {
           var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
        } catch (err) {
            alert('Failed to create CAdESCOM.About: ' + GetErrorMessage(err));
            return;
        }
        var ver = oAbout.CSPVersion("", 75);
        return ver.MajorVersion + "." + ver.MinorVersion + "." + ver.BuildVersion;
    }

    function ShowCSPVersion_NPAPI(CurrentPluginVersion)
    {
        if(typeof(CurrentPluginVersion) != "string")
        {
            document.getElementById('CSPVersionTxt').innerHTML = "Версия CSP: " + GetCSPVersion_NPAPI();
        }
    }
    function GetLatestVersion_NPAPI(CurrentPluginVersion) {
		$.ajax(
		{
			url: '//cryptopro.ru/sites/default/files/products/cades/latest_2_0.txt',
			success: function(r) {
                PluginBaseVersion = r;
                if (isPluginWorked) { // плагин работает, объекты создаются
                    if (VersionCompare_NPAPI(PluginBaseVersion, CurrentPluginVersion)<0) {
                        document.getElementById('PluginEnabledImg').setAttribute("src", "img/yellow_dot.png");
                        document.getElementById('PluginEnabledTxt').innerHTML = "Плагин загружен, но есть более свежая версия.";
                    }
                }
                else { // плагин не работает, объекты не создаются
                    if (isPluginLoaded) { // плагин загружен
                        if (!isPluginEnabled) { // плагин загружен, но отключен
                            document.getElementById('PluginEnabledImg').setAttribute("src", "img/red_dot.png");
                            document.getElementById('PluginEnabledTxt').innerHTML = "Плагин загружен, но отключен в настройках браузера.";
                        }
                        else { // плагин загружен и включен, но объекты не создаются
                            document.getElementById('PluginEnabledImg').setAttribute("src", "img/red_dot.png");
                            document.getElementById('PluginEnabledTxt').innerHTML = "Плагин загружен, но не удается создать объекты. Проверьте настройки браузера.";
                        }
                    }
                    else { // плагин не загружен
                        document.getElementById('PluginEnabledImg').setAttribute("src", "img/red_dot.png");
                        document.getElementById('PluginEnabledTxt').innerHTML = "Плагин не загружен.";
                    }
                }
			}
		});
    }
    
    var isPluginLoaded = false;
    var isPluginWorked = false;
    var isActualVersion = false;
    try {
        var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
        isPluginLoaded = true;
        isPluginEnabled = true;
        isPluginWorked = true;
        // Это значение будет проверяться сервером при загрузке демо-страницы
        var CurrentPluginVersion = oAbout.PluginVersion;
        if( typeof(CurrentPluginVersion) == "undefined")
            CurrentPluginVersion = oAbout.Version;

        document.getElementById('PluginEnabledImg').setAttribute("src", "img/green_dot.png");
        document.getElementById('PluginEnabledTxt').innerHTML = "Плагин загружен.";
//        document.getElementById('PluginVersionTxt').innerHTML = "Версия плагина: " + MakeVersionString(CurrentPluginVersion);
//        ShowCSPVersion_NPAPI(CurrentPluginVersion);
    }
    catch (err) {
        // Объект создать не удалось, проверим, установлен ли 
        // вообще плагин. Такая возможность есть не во всех браузерах
        var mimetype = navigator.mimeTypes["application/x-cades"];
        if (mimetype) {
            isPluginLoaded = true;
            var plugin = mimetype.enabledPlugin;
            if (plugin) {
                isPluginEnabled = true;
            }
        }
    }
    GetLatestVersion_NPAPI(CurrentPluginVersion);
    FillCertList_NPAPI(id);
}

function CertificateObj(certObj)
{
    this.cert = certObj;
    this.certFromDate = new Date(this.cert.ValidFromDate);
    this.certTillDate = new Date(this.cert.ValidToDate);
}
CertificateObj.prototype.check = function(digit){return (digit<10) ? "0"+digit : digit;}
CertificateObj.prototype.extract = function(from, what)
{
    certName = "";
    var begin = from.indexOf(what);
    if(begin>=0)
    {
        var end = from.indexOf(', ', begin);
        certName = (end<0) ? from.substr(begin) : from.substr(begin, end - begin);
    }
    return certName;
}
CertificateObj.prototype.DateTimePutTogether = function(certDate){return this.check(certDate.getUTCDate())+"."+this.check(certDate.getMonth()+1)+"."+certDate.getFullYear() + " " + this.check(certDate.getUTCHours()) + ":" + this.check(certDate.getUTCMinutes()) + ":" + this.check(certDate.getUTCSeconds());}
CertificateObj.prototype.GetCertString = function(){return this.extract(this.cert.SubjectName,'CN=') + "; Выдан: " + this.GetCertFromDate();}
CertificateObj.prototype.GetCertFromDate = function(){return this.DateTimePutTogether(this.certFromDate);}
CertificateObj.prototype.GetCertTillDate = function(){return this.DateTimePutTogether(this.certTillDate);}
CertificateObj.prototype.GetPubKeyAlgorithm = function(){return this.cert.PublicKey().Algorithm.FriendlyName;}
CertificateObj.prototype.GetCertName = function(){return this.extract(this.cert.SubjectName, 'CN=');}
CertificateObj.prototype.GetIssuer = function(){return this.extract(this.cert.IssuerName, 'CN=');}

function FillCertList_NPAPI(lstId) {
    try {
        var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
        oStore.Open();
    }
    catch (ex) {
        alert("Ошибка при открытии хранилища: " + GetErrorMessage(ex));
        return;
    }

    try {
        var lst = document.getElementById(lstId);
        if(!lst) return;
    }
    catch (ex) {return;}

    var certCnt;
    try {
        certCnt = oStore.Certificates.Count;
        if(certCnt==0)
            throw "Cannot find object or property. (0x80092004)";
    }
    catch (ex) {
        var message = GetErrorMessage(ex);
        if("Cannot find object or property. (0x80092004)" == message ||
           "oStore.Certificates is undefined" == message ||
           "Объект или свойство не найдено. (0x80092004)" == message)
        {
            oStore.Close();
            var errormes = document.getElementById("boxdiv").style.display = '';
            return;
        }
    }
   
    for (var i = 1; i <= certCnt; i++) {
        var cert;
        try {
            cert = oStore.Certificates.Item(i);
        }
        catch (ex) {
            alert("Ошибка при перечислении сертификатов: " + GetErrorMessage(ex));
            return;
        }

        var oOpt = document.createElement("OPTION");
        var dateObj = new Date();
        try {
            if(dateObj<cert.ValidToDate && cert.HasPrivateKey() && cert.IsValid().Result) {
                var certObj = new CertificateObj(cert);
                oOpt.text = certObj.GetCertString();
            }
            else {
                continue;
            }
        }
        catch (ex) {
            alert("Ошибка при получении свойства SubjectName: " + GetErrorMessage(ex));
        }
        try {
            oOpt.value = cert.Thumbprint;
        }
        catch (ex) {
            alert("Ошибка при получении свойства Thumbprint: " + GetErrorMessage(ex));
        }

        lst.options.add(oOpt);
    }

    oStore.Close();
}

function decimalToHexString(number) {
	if (number < 0) {
		number = 0xFFFFFFFF + number + 1;
	}

	return number.toString(16).toUpperCase();
}

function GetErrorMessage(e) {
	var err = e.message;
	if (!err) {
		err = e;
	} else if (e.number) {
		err += " (0x" + decimalToHexString(e.number) + ")";
	}
	return err;
}

function isIE() {
	var retVal = (("Microsoft Internet Explorer" == navigator.appName) || // IE < 11
		navigator.userAgent.match(/Trident\/./i)); // IE 11
	return retVal;
}

//---
var canPromise = !!window.Promise;
if (canPromise)
{
	cadesplugin.then(
		function () {
			init();
		},
		function(error) {
			alert('Ошибка загрузки плагина');
		}
   );
}
else
{
	window.addEventListener("message", function (event){
		if (event.data == "cadesplugin_loaded")
		{
			init();
		}
		else if(event.data == "cadesplugin_load_error")
		{
			alert('Ошибка загрузки плагина');
		}
	}, false);
	window.postMessage("cadesplugin_echo_request", "*");
}

function init() {
	Common_CheckForPlugIn('CertListBox');
	$(document).on('click', 'button[name=confirmsign],input[name=confirmsign]', function(e){
		e.preventDefault();
		Common_GetCertificate('CertListBox', GetCertificate_Result);
	});
}

function GetCertificate_Result(oCert, sCert) {
//	console.log('Got cert:');
//	console.log(sCert);
	if (typeof(oCert) != 'undefined')
	{
		var data = $('input[name=data]').val();
		Common_Hash(oCert, data, GetHash_Result);
	}
}

function GetHash_Result(oCert, hash) {
	//TODO подписываем полученный хэш
	$('input[name=hash]').val(hash);
	Common_SignHash(oCert, hash, GetSign_Result);
}

function GetSign_Result(signed) {
	$('input[name=signed]').val(signed);
}

