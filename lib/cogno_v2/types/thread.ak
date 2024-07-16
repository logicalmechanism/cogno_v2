use aiken/bytearray
use aiken/list
use aiken/transaction/value.{AssetName}

pub type ThreadDatum {
  // the title of the thread
  title: ByteArray,
  // the content of the thread
  content: ByteArray,
  // the thread may start with an image
  image: ByteArray,
  // the category of the thread
  category: ByteArray,
  // a list of comments, can be strings or images
  comments: List<ByteArray>,
  // the cafebabe tkn of the owner
  tkn: AssetName,
}

/// Check that the comment being added to the thread is valid, i.e. it can not
/// be empty and it must be pushed to the already existing comment list inside
/// the thread datum.
///
/// ```aiken
/// thread.is_valid_comment(this_datum, that_datum, redeemer_value)
/// ```
pub fn is_valid_comment(
  old: ThreadDatum,
  new: ThreadDatum,
  comment: ByteArray,
) -> Bool {
  and {
    // the thread details cant change
    old.title == new.title,
    old.content == new.content,
    old.image == new.image,
    old.category == new.category,
    old.tkn == new.tkn,
    // a new comment is just pushed to the end
    list.push(old.comments, comment) == new.comments,
    // can't be an empty comment
    !bytearray.is_empty(comment),
  }
}

// This validation becomes more expensive as the list grows
test prepend_to_list_check() {
  let x: List<Int> =
    [2, 3, 4, 5, 6]
  let y: List<Int> =
    [1, 2, 3, 4, 5, 6]
  list.push(x, 1) == y
}

test append_to_list_check() fail {
  let x: List<Int> =
    [2, 3, 4, 5, 6]
  let y: List<Int> =
    [2, 3, 4, 5, 6, 1]
  list.push(x, 1) == y
}

// A thread can only be removed or commented on.
pub type ThreadRedeemer {
  RemoveThread
  CommentThread(ByteArray)
}
