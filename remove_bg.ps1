Add-Type -AssemblyName System.Drawing
$imgPath = "d:\New folder\portfolio\public\okhc-logo.png"
$outPath = "d:\New folder\portfolio\public\okhc-logo-transparent.png"
$img = [System.Drawing.Bitmap]::FromFile($imgPath)

# Create a new bitmap with ARGB format to support transparency
$newImg = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($newImg)
$graphics.DrawImage($img, 0, 0)
$graphics.Dispose()
$img.Dispose()

$transparent = [System.Drawing.Color]::Transparent
for ($x = 0; $x -lt $newImg.Width; $x++) {
    for ($y = 0; $y -lt $newImg.Height; $y++) {
        $c = $newImg.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -gt 230 -and $c.B -gt 230) {
            $newImg.SetPixel($x, $y, $transparent)
        }
    }
}
$newImg.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$newImg.Dispose()
Write-Host "SUCCESS"
