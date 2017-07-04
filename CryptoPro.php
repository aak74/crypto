<?php

class CryptoPro
{
  public function getHash($data)
  {
    $hd = new CPHashedData();
    $hd->set_Algorithm(HASH_ALGORITHM_GOSTR_3411);
    $hd->set_DataEncoding(1);
    $hd->hash(base64_encode($data));
    return $hd->get_Value();
  }

}
