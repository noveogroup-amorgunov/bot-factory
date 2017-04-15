<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

//Request::setTrustedProxies(array('127.0.0.1'));

$app->get('/', function () use ($app) {
    return new Response('Pizza API');
})
    ->bind('homepage');

$pizzaStore = [
    'pepperoni' => [
        'name' => 'Пепперони',
        'image' => 'http://slice.seriouseats.com/images/20100201-delivery-papajohns.jpg',
        'description' => 'Пепперони - одна из самых популярных пицц в мире. Да что уж, это самая популярная пицца во Вселенной!',
    ],
    'margarita' => [
        'name' => 'Маргарита',
        'image' => 'https://qph.ec.quoracdn.net/main-qimg-311ad5650cf27f9a806ada70a21a2678-c',
        'description' => 'Эта пицца названа в честь итальянской королевы Маргариты Савонской, покровительницы Красного креста.',
    ],
    'cheese' => [
        'name' => 'Сырная',
        'image' => 'http://www.jackspizza.com/media/1039/cheese.jpg',
        'description' => 'Восхитительно вкусная за счет идеального сочетания четырех сортов сыра.',
    ],
];
$pizzaPrice = [
    'small' => ['value' => '25 см', 'price' => 300],
    'middle' => ['value' => '30 см', 'price' => 450],
    'large' => ['value' => '35 см', 'price' => 550],
];

$app->get('/product/{code}', function (Request $request) use ($app, $pizzaStore) {
    $code = $request->get('code');
    return new JsonResponse($pizzaStore[$code]);
});

$app->get('/products', function () use ($app, $pizzaStore) {
    return new JsonResponse($pizzaStore);
});

$app->get('/sizes', function () use ($app, $pizzaPrice) {
    return new JsonResponse($pizzaPrice);
});

$app->post('/order', function (Request $request) use ($pizzaStore, $pizzaPrice) {
    $type = $request->request->get('code');
    $size = $request->request->get('size');
    $quantity = $request->get('quantity');

    // process order..

    return new JsonResponse([
            'success' => true,
            'message' => sprintf('Thank you for your order! %s is already coming to you. Total price: %d',
                $pizzaStore[$type]['name'],
                $pizzaPrice[$size]['price'] * $quantity
            ),
        ]
    );
});

// Constructor requests

$app->get('constructor/types', function () use ($app, $pizzaStore) {
    return new JsonResponse(['data' => array_values(array_map(function ($value) {
        return $value['name'];
    }, $pizzaStore))]);
});

$app->get('constructor/sizes', function () use ($app, $pizzaPrice) {
    return new JsonResponse(['data' => array_values(array_map(function ($value) {
        return $value['value'];
    }, $pizzaPrice))]);
});


$app->error(function (\Exception $e, Request $request, $code) use ($app) {
    if ($app['debug']) {
        return;
    }

    // 404.html, or 40x.html, or 4xx.html, or error.html
    $templates = array(
        'errors/' . $code . '.html.twig',
        'errors/' . substr($code, 0, 2) . 'x.html.twig',
        'errors/' . substr($code, 0, 1) . 'xx.html.twig',
        'errors/default.html.twig',
    );

    return new Response($app['twig']->resolveTemplate($templates)->render(array('code' => $code)), $code);
});
