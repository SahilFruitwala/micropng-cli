require "language/node"

class MicropngCli < Formula
  desc "High-performance CLI image compressor using sharp and libvips"
  homepage "https://github.com/SahilFruitwala/micropng-cli"
  url "https://registry.npmjs.org/micropng-cli/-/micropng-cli-0.4.0.tgz"
  sha256 "e5206d150834527c0b4fcb4c3027e2121358fa903b1ad418172d3605a33b148c"
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
