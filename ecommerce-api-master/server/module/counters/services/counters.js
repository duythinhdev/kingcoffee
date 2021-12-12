exports.getNextSequenceValue = async sequenceName => {
  try {
    const sequenceDocument = await DB.Counters.findOneAndUpdate({ type: sequenceName }, { $inc: { sequence_value: 1 } })
    // const sequenceDocument = await DB.Counters.findAndModify({
    //   query: {_id: sequenceName},
    //   update: {$inc: {sequence_value: 1}},
    //   new: true
    // });
    if (!sequenceDocument) {
      const newSeq = await DB.Counters.create({
        type: sequenceName
      })

      return 1
    }

    return sequenceDocument.sequence_value + 1;
  } catch (e) {
    throw e
  }
}