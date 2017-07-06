<?
$result = [
  'status' => 'error'
];
if (!empty($_POST)) {
    parse_str($_POST['data']);

    $str = <<<XML
<?xml version='1.0'?>
<document>
  <lastname>$lastname</lastname>
  <firstname>$firstname</firstname>
  <city>$city</city>
</document>
XML;
    file_put_contents('./download/form-data.xml', $str);
    require_once('CryptoPro.php');
    $cryptopro = new CryptoPro;
    $result = [
      'hash' => $cryptopro->getHash($str),
      'status' => 'ok'
    ];
}
echo json_encode($result);
