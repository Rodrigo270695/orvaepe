<?php

use Inertia\Testing\AssertableInertia as Assert;

it('renders the public portfolio page', function () {
    $this->withoutVite();

    $this->get(route('marketing-portfolio'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portafolio')
            ->has('softwareCategories')
            ->has('showcaseClients')
        );
});

it('no longer sends showcase clients to the home page', function () {
    $this->withoutVite();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->missing('showcaseClients')
        );
});
