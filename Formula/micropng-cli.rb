require "language/node"

class MicropngCli < Formula
  desc "High-performance CLI image compressor using sharp and libvips"
  homepage "https://github.com/SahilFruitwala/micropng-cli"
  url "https://registry.npmjs.org/micropng-cli/-/micropng-cli-0.3.1.tgz"
  sha256 "70e84ea7fa076fdf2c2be881fe60eb9426dc3456f63db53f2135ca956b06031d"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/micropng-cli", "--version"
  end
end
