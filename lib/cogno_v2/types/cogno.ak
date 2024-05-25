use assist/types/wallet.{Wallet}

pub type Profile {
  cogno: ByteArray,
  image: ByteArray,
  details: ByteArray,
}

pub type CognoDatum {
  owner: Wallet,
  profile: Profile,
}

pub type CognoRedeemer {
  RemoveCogno
  UpdateCogno
}
