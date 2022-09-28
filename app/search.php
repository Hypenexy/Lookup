<?php
function is_valid_domain_name($domain_name)
{
    return (preg_match("/^([a-z\d](-*[a-z\d])*)(\.([a-z\d](-*[a-z\d])*))*$/i", $domain_name) //valid chars check
            && preg_match("/^.{1,253}$/", $domain_name) //overall length check
            && preg_match("/^[^\.]{1,63}(\.[^\.]{1,63})*$/", $domain_name)   ); //length of each label
}

if(isset($_POST["search"])){
    $datatosend = (object) [];
    $datatosend->status = "success";
    $name = $_POST["search"];
    
    if(filter_var($name, FILTER_VALIDATE_IP)){

    }
    else{
        if(is_valid_domain_name($name)){
            if(str_contains($name, "//")){
                $name = explode('/', $name)[2];
            }
            $datatosend->domainname = $name;
            // try {
            //     $name = gethostbyname($name);
            // } catch (\Throwable $th) {
            //     $datatosend->status = "dnsfailure";
            // }
        }
        else{
            $datatosend->status = "matchfailure";
        }
    }

    if($datatosend->status != "matchfailure"){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=im not sharing my api even though i dont want it lol&domainName=".$name);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($ch);
        curl_close($ch);
        $datatosend->dnsinfo = $output;
    }

    $datatosend->ip = $name;
    echo json_encode($datatosend);
}