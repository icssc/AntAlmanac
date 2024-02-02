// adding a subscription
router.post('/subscribe', async (req, res) => {
    const schema = Joi.object({
      subscription: Joi.object({
        endpoint: Joi.string().uri().required(),
        keys: Joi.object({
          p256dh: Joi.string().required(),
          auth: Joi.string().required()
        })
      }),
      groups: Joi.array().items(Joi.string())
    })
    const { error } = schema.validate(req.body, { allowUnknown: true })
    if (error) return res.send({ error: error.details[0].message })
  
    const subscription = {
      key: utils.md5(req.body.subscription.endpoint),
      endpoint: req.body.subscription.endpoint,
      pushKeys: utils.encryptJSON(req.body.subscription.keys),
      groups: req.body.groups || [] // this is just so I could associate extra info with a subscription object
    }
    // Make the first group the subscription ID so we can notify individuals if needed
    subscription.groups.unshift('id:' + subscription.key) // same extra info
    const item = await subscriptionsDB.put(subscription).catch(() => {})
    if (!item) return res.status(500).send({ error: 'Internal server error' })
    res.status(201).send(subscription)
  })
  
  // function to send notifications
  async function sendNotifications (subscriptions, contents) {
    const expired = await Promise.all(subscriptions.map(async s => {
      return webpush.sendNotification({ endpoint: s.endpoint, keys: s.pushKeys }, contents)
        .then(() => undefined).catch(() => s)
    })).then(errs => errs.filter(key => !!key))
  
    await deleteSubscriptions(expired.map(e => e.key)) // just removes them from subscriptsionsDB
  
    const delievered = subscriptions.filter(s => !expired.includes(s))
    subscriptions.forEach(s => { delete s.pushKeys; delete s.service })
    return { delievered, expired }
  }

