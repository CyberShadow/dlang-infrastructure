terraform {
  backend "remote" {
    organization = "dlang"

    workspaces {
      name = "hcloud"
    }
  }
}
