$url = 'https://www.myinstants.com/media/sounds/fahhh_KcgAXfs.mp3'
$tmp = "$env:TEMP\fahhh_sound.mp3"
if (-not (Test-Path $tmp)) {
    (New-Object Net.WebClient).DownloadFile($url, $tmp)
}
$wmp = New-Object -ComObject WMPlayer.OCX
$wmp.URL = $tmp
$wmp.controls.play()
Start-Sleep -Seconds 4
$wmp.close()
