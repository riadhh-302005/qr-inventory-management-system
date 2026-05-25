{pkgs}: {
  deps = [
    pkgs.php82Extensions.iconv
    pkgs.php82Extensions.mbstring
    pkgs.php82Extensions.mongodb
    pkgs.mongodb
  ];
}
