use aiken/transaction/value.{AssetName}
use assist/types/wallet.{Wallet}

pub type Profile {
  cogno: ByteArray,
  image: ByteArray,
  details: ByteArray,
}

pub type Moderation {
  // show posts from these users
  friendly_user_list: List<AssetName>,
  // do not show posts from these users
  restricted_user_list: List<AssetName>,
  // do not show these threads
  restricted_thread_list: List<AssetName>,
}

pub type CognoDatum {
  owner: Wallet,
  profile: Profile,
  moderation: Moderation,
}

pub type CognoRedeemer {
  RemoveCogno
  UpdateCogno
}
