# Dlang Tour (tour.dlang.org)

resource "hcloud_server" "tour" {
  name        = "tour"
  image       = "ubuntu-22.04"
  location    = "fsn1"
  server_type = "cx11"
  user_data = templatefile("${path.module}/cloud-init-tour.sh.tftpl", {
    # We can add parameters such as Docker image tag here...
  })
  ssh_keys = keys(hcloud_ssh_key.user_key)
}
