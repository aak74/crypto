<?
file_put_contents('data.xml.sig1', $_POST['data']);
file_put_contents('data.xml.sig', base64_decode($_POST['data']));
echo 'updateSignature';
