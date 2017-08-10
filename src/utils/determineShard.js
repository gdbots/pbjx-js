import md5 from 'md5';

/**
 * Determines what shard the provided string should be on.
 *
 * @param {string} string - String input use to determine shard.
 * @param {number} shards - Size of shard pool.
 *
 * @returns {number} Returns an integer between 0 and (shards-1), i.e. 0-255
 */
export default function determineShard(string, shards = 256) {
  // first 4 chars of md5 give us a 16 bit keyspace (0-65535)
  const num = parseInt(md5(string).substr(0, 4), 16);
  return num % shards;
}
