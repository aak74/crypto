<?
$str = file_get_contents('./download/data.xml');
file_put_contents('./download/capi-data.xml', $str);
echo $str;
