(function ($) {
  Vue.config.devtools = true;

  if (!$('.schedule-dashboard__wrapper').length) {
    return;
  }

  var router = new VueRouter({
      mode: 'history',
      routes: []
  });

  Vue.component('sidebar-filter', {
    props: ['title', 'id', 'options', 'default', 'type'],
    data: function() {
      return {
        checkboxes: [],
        checked: [],
        expanded: true,
        expanded_checkboxes: {},
        dependencies: {},
      }
    },
    created() {
      this.checkboxes = JSON.parse(this.options);
      this.checked = this.default.split(',');
      for (var i in this.checkboxes) {
        checkbox = this.checkboxes[i];
        if (typeof checkbox == 'object') {
          this.dependencies[checkbox.label] = [];
          for (var k in checkbox.value) {
            var item = checkbox.value[k];
            this.dependencies[checkbox.label].push(item.value);
          }
        }
      }
    },
    watch: {
      checked: function(values) {
        this.$emit('updated-values', values);
      }
    },
    methods: {
      clear: function() {
        this.checked = [];
      },
      getId: function(string) {
        return string.replace(/^[0-9a-zA-Z]/g, '-');
      },
      getOption: function(data) {
        return data.value;
      },
      getLabel: function(data) {
        return data.label;
      },
      collapseGroup: function(checkbox) {
        var label = this.getLabel(checkbox);
        return typeof this.expanded_checkboxes[label] == 'undefined' || this.expanded_checkboxes[label] == false;
      },
      groupStatus: function(value) {
        if (typeof this.dependencies[value] == 'undefined') {
          return false;
        }

        var foundChecked = false;
        var foundUnChecked = false;
        for (var i in this.dependencies[value]) {
          if (this.checked.indexOf(this.dependencies[value][i]) != -1) {
            foundChecked = true;
          }
          else {
            foundUnChecked = true;
          }
        }

        if (foundChecked && foundUnChecked) {
          return 'partial';
        }

        if (foundChecked) {
          return 'all';
        }
        else {
          return 'none';
        }
      },
      selectDependent: function(value) {
        if (typeof this.dependencies[value] == 'undefined') {
          return false;
        }

        var removeValue = (this.groupStatus(value) == 'all' || this.groupStatus(value) == 'partial');
        for (var i in this.dependencies[value]) {
          var key = this.checked.indexOf(this.dependencies[value][i]);
          if (typeof this.dependencies[value][i] != 'string') {
            continue;
          }
          // If we need to add and it was not checked yet.
          if (key == -1 && !removeValue) {
            Vue.set(this.checked, this.checked.length, this.dependencies[value][i]);
          }
          // If already checked but we need to uncheck.
          if (key != -1 && removeValue) {
            Vue.set(this.checked, key, '');
          }
        }
      }
    },
    template: '<div class="form-group-wrapper">\n' +
    '                <label v-on:click="expanded = !expanded">\n' +
    '                 {{ title }}\n' +
    '                  <i v-if="expanded" class="fa fa-minus minus" aria-hidden="true"></i>\n' +
    '                  <i v-if="!expanded" class="fa fa-plus plus" aria-hidden="true"></i>\n' +
    '                </label>\n' +
    '                <div v-bind:class="[type]">\n' +
    '                  <div v-for="checkbox in checkboxes" class="checkbox-wrapper" ' +
    '                     v-show="type != \'tabs\' || expanded || checked.indexOf(getOption(checkbox)) != -1"' +
    '                     v-bind:class="{\'col-xs-6 col-sm-4\': type == \'tabs\'}">' +
                         // No parent checkbox.
    '                    <input v-if="typeof getOption(checkbox) != \'object\'" v-show="expanded || checked.indexOf(getOption(checkbox)) != -1" type="checkbox" v-model="checked" :value="getOption(checkbox)" :id="\'checkbox-\' + id + \'-\' + getOption(checkbox)">\n' +
    '                    <label v-if="typeof getOption(checkbox) != \'object\'" v-show="expanded || checked.indexOf(getOption(checkbox)) != -1" :for="\'checkbox-\' + id + \'-\' + getOption(checkbox)">{{ getLabel(checkbox) }}</label>\n' +
                         // Locations with sub-locations/branches.
    '                    <div v-if="typeof getOption(checkbox) == \'object\'">' +
    '                       <a v-show="expanded" v-on:click.stop.prevent="selectDependent(getLabel(checkbox))" href="#" v-bind:class="{ ' +
    '                         \'checkbox-unchecked\': groupStatus(getLabel(checkbox)) == \'none\', ' +
    '                         \'checkbox-checked\': groupStatus(getLabel(checkbox)) == \'all\', ' +
    '                         \'checkbox-partial\': groupStatus(getLabel(checkbox)) == \'partial\', ' +
    '                         \'d-flex\': true' +
    '                       }">' +
    '                       <input v-if="typeof getOption(checkbox) == \'object\'" v-show="expanded || checked.indexOf(getOption(checkbox)) != -1" type="checkbox" v-model="checked">\n' +
    '                       <label v-if="typeof getOption(checkbox) == \'object\'" v-show="expanded || checked.indexOf(getOption(checkbox)) != -1" >{{ getLabel(checkbox) }}</label>\n' +
    '                       <a v-if="typeof getOption(checkbox) == \'object\' && expanded" href="#" class="checkbox-toggle-subset ml-auto">' +
    '                         <span v-show="collapseGroup(checkbox)" v-on:click.stop.prevent="Vue.set(expanded_checkboxes, getLabel(checkbox), true);" class="fa fa-angle-down" aria-hidden="true"></span>' +
    '                         <span v-if="typeof getOption(checkbox) == \'object\' && expanded" v-show="!collapseGroup(checkbox)" v-on:click.stop.prevent="expanded_checkboxes[getLabel(checkbox)] = false" class="fa fa-angle-up" aria-hidden="true"></span>' +
    '                       </a>' +
    '                    </div>' +
    '                    <div v-if="typeof getOption(checkbox) == \'object\'" v-for="checkbox2 in getOption(checkbox)" class="checkbox-wrapper">\n' +
    '                      <input v-if="checked.indexOf(getOption(checkbox2)) != -1 || (expanded && !collapseGroup(checkbox))" type="checkbox" v-model="checked" :value="getOption(checkbox2)" :id="\'checkbox-\' + id + \'-\' + getOption(checkbox2)">\n' +
    '                      <label v-if="checked.indexOf(getOption(checkbox2)) != -1 || (expanded && !collapseGroup(checkbox))" :for="\'checkbox-\' + id + \'-\' + getOption(checkbox2)">{{ getLabel(checkbox2) }}</label>\n' +
    '                    </div>\n' +
    '                  </div>\n' +
    '                </div>\n' +
    '              </div>'
  });

  // Retrieve the data via vue.js.
  new Vue({
    el: '#app',
    router: router,
    data: {
      table: {},
      loading: false,
      count: '',
      pages: { 0:'' },
      current_page: 0,
      keywords: '',
      locations: [],
      ages: [],
      days: [],
      categories: [],
      categoriesExcluded: [],
      categoriesLimit: [],
      moreInfoPopupLoading: false,
      runningClearAllFilters: false,
      afPageRef: '',
      locationPopup: {
        address: '',
        email: '',
        phone: '',
        title: '',
        days: []
      },
      availabilityPopup: {
        note: '',
        status: '',
        price: '',
        link: '',
      },
      moreInfoPopup: {
        name: '',
        description: '',
        price: '',
        ages: '',
        gender: '',
        dates: '',
        times: '',
        days: '',
        location_name: '',
        location_address: '',
        location_phone: '',
        availability_status: '',
        availability_note: '',
        link: ''
      }
    },
    created() {
      var component = this;

      var locationsGet = decodeURIComponent(this.$route.query.locations);
      if (locationsGet) {
        this.locations = locationsGet.split(',');
      }

      var categoriesGet = decodeURIComponent(this.$route.query.categories);
      if (categoriesGet) {
        this.categories = categoriesGet.split(',');
      }

      var agesGet = decodeURIComponent(this.$route.query.ages);
      if (agesGet) {
        this.ages = agesGet.split(',');
      }

      var daysGet = decodeURIComponent(this.$route.query.days);
      if (daysGet) {
        this.days = daysGet.split(',');
      }

      var keywordsGet = decodeURIComponent(this.$route.query.keywords);
      if (keywordsGet) {
        this.keywords = keywordsGet;
      }

      this.runAjaxRequest();

      component.afPageRef = $('.field-prgf-af-page-ref a').attr('href');

      // We add watchers dynamically otherwise initially there will be
      // up to three requests as we are changing values while initializing
      // from GET query parameters.
      component.$watch('locations', function(){
        if (!component.runningClearAllFilters) {
          component.runAjaxRequest();
        }
      });
      component.$watch('categories', function(){
        if (!component.runningClearAllFilters) {
          component.runAjaxRequest();
        }
      });
      component.$watch('ages', function(){
        if (!component.runningClearAllFilters) {
          component.runAjaxRequest();
        }
      });
      component.$watch('days', function(){
        if (!component.runningClearAllFilters) {
          component.runAjaxRequest();
        }
      });
    },
    methods: {
      runAjaxRequest: function() {
        var component = this;

        var url = drupalSettings.path.baseUrl + 'af/get-data';

        var query = [];
        var cleanLocations = this.locations.filter(function(word){ return word.length > 0; });
        if (cleanLocations.length > 0) {
          query.push('locations=' + encodeURIComponent(cleanLocations.join(',')));
        }
        if (this.keywords.length > 0) {
          query.push('keywords=' + encodeURIComponent(this.keywords));
        }
        var cleanCategories = this.categories.filter(function(word){ return word.length > 0; });
        if (cleanCategories.length > 0) {
          query.push('categories=' + encodeURIComponent(cleanCategories.join(',')));
        }
        var cleanAges = this.ages.filter(function(word){ return word.length > 0; });
        if (cleanAges.length > 0) {
          query.push('ages=' + encodeURIComponent(cleanAges.join(',')));
        }
        var cleanDays = this.days.filter(function(word){ return word.length > 0; });
        if (cleanDays.length > 0) {
          query.push('days=' + encodeURIComponent(cleanDays.join(',')));
        }
        if (typeof this.pages[this.current_page] != 'undefined') {
          query.push('next=' + encodeURIComponent(this.pages[this.current_page]));
          query.push('page=' + encodeURIComponent(this.current_page + 1));
        }

        if (query.length > 0) {
          url += '?' + query.join('&');
        }

        this.loading = true;

        $.getJSON(url, function(data) {
          component.table = data.table;
          component.count = data.count;
          component.pages[component.current_page + 1] = data.pager;
          component.loading = false;
        });

        router.push({ query: {
          locations: cleanLocations.join(','),
          categories: cleanCategories.join(','),
          ages: cleanAges.join(','),
          days: cleanDays.join(','),
          keywords: this.keywords,
          page: this.page
        }});
      },
      populatePopupLocation: function(index) {
        this.locationPopup = this.table[index].location_info;
      },
      populatePopupMoreInfo: function(index) {
        var component = this;

        var url = drupalSettings.path.baseUrl + 'pef-programs-more-info-ajax';

        // Pass all the query parameters to Details call so we could build the logging.
        var query = [];
        query.push('log=' + encodeURIComponent(this.table[index].log_id));
        query.push('details=' + encodeURIComponent(this.table[index].name));
        query.push('nid=' + encodeURIComponent(this.table[index].nid));

        query.push('program=' + encodeURIComponent(this.table[index].program_id));
        query.push('offering=' + encodeURIComponent(this.table[index].offering_id));
        query.push('location=' + encodeURIComponent(this.table[index].location_id));

        if (query.length > 0) {
          url += '?' + query.join('&');
        }

        component.moreInfoPopupLoading = true;
        $.getJSON(url, function(data) {
          component.moreInfoPopupLoading = false;
          component.moreInfoPopup = data;
          component.table[index].price = data.price;

          component.moreInfoPopup.dates = component.table[index].dates;
          component.moreInfoPopup.times = component.table[index].times;
          component.moreInfoPopup.days = component.table[index].days;

          component.moreInfoPopup.location_name = component.table[index].location_info.title;
          component.moreInfoPopup.location_address = component.table[index].location_info.address;
          component.moreInfoPopup.location_phone = component.table[index].location_info.phone;

          component.table[index].availability_status = data.availability_status;
          component.table[index].availability_note = data.availability_note;

          component.availabilityPopup.status = component.table[index].availability_status;
          component.availabilityPopup.note = component.table[index].availability_note;
          component.availabilityPopup.link = component.table[index].register_link;
          component.availabilityPopup.price = component.table[index].price;
        });
      },
      clearFilters: function() {
        this.runningClearAllFilters = true;
        this.locations = [];
        this.categories = [];
        this.ages = [];
        this.days = [];
        this.runningClearAllFilters = false;
        this.$refs.ages_filter.clear();
        this.$refs.locations_filter.clear();
        this.$refs.categories_filter.clear();
        this.$refs.days_filter.clear();
        this.runAjaxRequest();
      },
      loadPrevPage: function() {
        this.current_page--;
        this.table = [];
        this.runAjaxRequest();
      },
      loadNextPage: function() {
        this.current_page++;
        this.table = [];
        this.runAjaxRequest();
      }
    },
    delimiters: ["${","}"]
  });

})(jQuery);
