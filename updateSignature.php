<?
file_put_contents('data.xml-raw.sig', $_POST['data']);
file_put_contents('data.xml-decoded.sig', base64_decode($_POST['data']));
echo 'updateSignature';
