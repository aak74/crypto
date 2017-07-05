<?

// echo base64_encode(file_get_contents('data.xml'));
// return;
// // echo base64_encode('Hello World');
require_once('CryptoPro.php');
$cryptopro = new CryptoPro;
$hash = $cryptopro->getHash(file_get_contents('data.xml'));
file_put_contents('data.xml.hsh', $hash);
echo $hash;
