use aiken/transaction/value.{AssetName}
use assist/types/wallet.{Wallet}

pub type Profile {
  // the profile name
  name: ByteArray,
  // the profile image
  image: ByteArray,
  // the profile details
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
  // the owner of the cogno
  owner: Wallet,
  // the cogno profile
  profile: Profile,
  // the cogno moderation options
  moderation: Moderation,
}

/// Can only remove and update a cogno
pub type CognoRedeemer {
  RemoveCogno
  UpdateCogno
}
