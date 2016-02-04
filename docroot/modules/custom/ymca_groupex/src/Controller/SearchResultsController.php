<?php

/**
 * @file
 * Contains \Drupal\ymca_groupex\Controller\SearchResultsController.
 */

namespace Drupal\ymca_groupex\Controller;

use Drupal\node\NodeInterface;

/**
 * Implements SearchResultsController.
 */
class SearchResultsController {

  /**
   * Show the page.
   */
  public function pageView(NodeInterface $node) {
    $view = node_view($node, 'groupex');
    $markup = render($view);

    return [
      '#markup' => $markup,
      '#cache' => [
        'max-age' => 0,
      ],
    ];
  }

}
