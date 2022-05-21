terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.29"
    }
  }
}

provider "hcloud" {
}

locals {
  github_users = ["CyberShadow", "PetarKirov"]
}

data "http" "ssh_keys" {
  for_each = toset(local.github_users)
  url      = "https://github.com/${each.key}.keys"
}

locals {
  ssh_keys = flatten([
    for user in local.github_users : [
      for idx, key in compact(split("\n", data.http.ssh_keys[user].body)) : {
        user = user
        idx  = idx
        key  = key
      }
    ]
  ])
}

resource "hcloud_ssh_key" "user_key" {
  for_each   = { for k in local.ssh_keys : "${k.user}-${k.idx}" => k.key }
  name       = each.key
  public_key = each.value
}
