function getStickyOrFixedHeaderHeight (options = {}) {
  let root = options.root
  let win = options.win || window
  let edgeSlop = typeof options.edgeSlop === 'number' ? options.edgeSlop : 4
  let headerThreshold =
    typeof options.headerThreshold === 'number' ? options.headerThreshold : 200
  let elementsFromPointMaxDepth =
    typeof options.elementsFromPointMaxDepth === 'number'
      ? options.elementsFromPointMaxDepth
      : 24
  let ancestorMaxDepth =
    typeof options.ancestorMaxDepth === 'number' ? options.ancestorMaxDepth : 14

  let doc = win.document
  let body = root && root.nodeType === 9 ? root.body : root
  if (!body) {
    body = doc.body
  }

  if (!body || typeof body.querySelectorAll !== 'function') {
    return 0
  }

  let candidates = collectTopChromeCandidates(
    body,
    doc,
    elementsFromPointMaxDepth,
    ancestorMaxDepth
  )

  let maxBottom = 0

  candidates.forEach((el) => {
    let rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      return
    }
    if (rect.top > headerThreshold) {
      return
    }

    let style = win.getComputedStyle(el)
    let position = style.position

    if (position !== 'fixed' && position !== 'sticky') {
      return
    }

    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
      return
    }

    let top = rect.top
    let parsedTop = parseFloat(style.top)
    let anchorTop = Number.isFinite(parsedTop) ? parsedTop : 0

    if (position === 'fixed') {
      if (top >= anchorTop - edgeSlop && top <= anchorTop + edgeSlop) {
        maxBottom = Math.max(maxBottom, rect.bottom)
      }
    } else if (position === 'sticky') {
      if (top <= anchorTop + edgeSlop && top >= anchorTop - edgeSlop) {
        maxBottom = Math.max(maxBottom, rect.bottom)
      }
    }
  })

  return Math.round(maxBottom)
}

function collectTopChromeCandidates (
  body,
  doc,
  elementsFromPointMaxDepth,
  ancestorMaxDepth
) {
  let set = new Set()
  let semantic = body.querySelectorAll(
    'header, [role="banner"], .site-header, nav, #wpadminbar'
  )

  for (let i = 0; i < semantic.length; i++) {
    set.add(semantic[i])
  }

  let kids = body.children
  for (let i = 0; i < kids.length; i++) {
    set.add(kids[i])
  }

  if (typeof doc.elementsFromPoint !== 'function') {
    return set
  }

  let win = doc.defaultView
  if (!win) {
    return set
  }

  let w = win.innerWidth || 0
  let xs = w > 24 ? [8, Math.floor(w / 2), w - 8] : [Math.max(1, Math.floor(w / 2))]
  let y = 2

  for (let x = 0; x < xs.length; x++) {
    let stack = doc.elementsFromPoint(xs[x], y)
    if (!stack || !stack.length) {
      continue
    }

    let limit = Math.min(stack.length, elementsFromPointMaxDepth)
    for (let i = 0; i < limit; i++) {
      addAncestorsWithinBody(set, stack[i], body, ancestorMaxDepth)
    }
  }

  return set
}

function addAncestorsWithinBody (set, el, body, maxDepth) {
  let node = el
  let depth = 0

  while (node && node !== body && depth < maxDepth) {
    if (node.nodeType === 1) {
      set.add(node)
    }
    node = node.parentElement
    depth++
  }

  if (node === body && body.nodeType === 1) {
    set.add(body)
  }
}

export {
  getStickyOrFixedHeaderHeight,
}
