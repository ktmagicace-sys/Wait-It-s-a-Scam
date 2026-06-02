import Foundation
import CoreImage

let arguments = CommandLine.arguments

guard arguments.count == 2 else {
  fputs("usage: generate_qr.swift <url>\n", stderr)
  exit(1)
}

let urlString = arguments[1]
let terminalQuietZone = 2

guard let filter = CIFilter(name: "CIQRCodeGenerator") else {
  fputs("CIQRCodeGenerator filter is unavailable.\n", stderr)
  exit(1)
}

filter.setValue(Data(urlString.utf8), forKey: "inputMessage")
filter.setValue("M", forKey: "inputCorrectionLevel")

guard let qrImage = filter.outputImage else {
  fputs("Failed to render QR image.\n", stderr)
  exit(1)
}

let context = CIContext()

func printTerminalQRCode(from image: CIImage) throws {
  guard let cgImage = context.createCGImage(image, from: image.extent) else {
    throw NSError(domain: "generate_qr", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to rasterize QR matrix."])
  }

  guard
    let provider = cgImage.dataProvider,
    let data = provider.data
  else {
    throw NSError(domain: "generate_qr", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to read QR bitmap data."])
  }

  let bytes = CFDataGetBytePtr(data)!
  let width = cgImage.width
  let height = cgImage.height
  let bytesPerRow = cgImage.bytesPerRow
  let bytesPerPixel = cgImage.bitsPerPixel / 8

  let black = "██"
  let white = "  "
  let horizontalPadding = String(repeating: white, count: terminalQuietZone)
  let blankLine = String(repeating: white, count: width + (terminalQuietZone * 2))

  for _ in 0..<terminalQuietZone {
    print(blankLine)
  }

  for y in 0..<height {
    var line = horizontalPadding
    for x in 0..<width {
      let offset = (y * bytesPerRow) + (x * bytesPerPixel)
      let red = Int(bytes[offset])
      let green = Int(bytes[offset + 1])
      let blue = Int(bytes[offset + 2])
      let luminance = (red + green + blue) / 3
      line += luminance < 128 ? black : white
    }
    line += horizontalPadding
    print(line)
  }

  for _ in 0..<terminalQuietZone {
    print(blankLine)
  }
}
try printTerminalQRCode(from: qrImage)
